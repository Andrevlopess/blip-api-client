import aiohttp
import asyncio
from uuid import uuid4
from urllib import parse
from pydantic import BaseModel, Field
from typing import Any, Dict, Generic, List, Type, TypeVar, Union

T = TypeVar("T")


class Attendant(BaseModel):
    identity: str
    fullName: str
    email: str
    teams: list[str] = Field(default_factory=list)
    agentSlots: int
    isEnabled: bool

class BlipClient:
    """
    Reusable async client for the Blip/IRIS HTTP API.
    Owns its own aiohttp session and concurrency semaphore.
    Use as an async context manager:

        async with BlipClient(bot_key=ROUTER_KEY) as client:
            result = await client.set_attendant_queues(...)
    """

    def __init__(self, tenant: str, bot_key: str, max_concurrency: int = 10):
        self._base_url = f'https://{tenant}.http.msging.net/commands'
        self._bot_key = bot_key
        self._max_concurrency = max_concurrency
        self._session: aiohttp.ClientSession | None = None
        self._semaphore: asyncio.Semaphore | None = None

    # ------------------------------------------------------------------ #
    #  Lifecycle                                                           #
    # ------------------------------------------------------------------ #

    async def __aenter__(self) -> "BlipClient":
        self._semaphore = asyncio.Semaphore(self._max_concurrency)
        self._session = aiohttp.ClientSession(
            headers={
                "Authorization": f"Key {self._bot_key}",
                "Content-Type": "application/json",
            }
        )
        return self

    async def __aexit__(self, *_) -> None:
        if self._session:
            await self._session.close()

    # ------------------------------------------------------------------ #
    #  Core transport                                                      #
    # ------------------------------------------------------------------ #

    async def send_command(self, body: dict, response_model: Type[T]) -> T | None:
        """POST a single command and return the parsed response."""
        if self._session is None or self._semaphore is None:
            raise RuntimeError("Client must be used as an async context manager.")

        payload = {"id": str(uuid4()), **body}

        try:
            async with self._semaphore:
                async with self._session.post(self._base_url, json=payload) as resp:
                    res =  await resp.json()

                    if res.get("status") == 'failure':
                        print(f"[BlipClient] Command failed: {res.get("reason", {}).get("description", "No description")}")
                        return None
                    
                    return response_model(**res)
        except Exception as exc:
            print(f"[BlipClient] send_command error: {exc}")
            return None

    # ------------------------------------------------------------------ #
    #  Domain methods                                                      #
    # ------------------------------------------------------------------ #

    async def set_queue_tags(self, queue: str, tags: list[str]) -> list:
        body = {
            "method": "set",
            "to": "postmaster@desk.msging.net",
            "uri": f"/attendance-queues/{parse.quote(queue)}/tags",
            "type": "application/vnd.lime.collection+json",
            "resource": {
                "itemType": "application/vnd.iris.desk.attendancequeuetag+json",
                "items": [{ "tag": tag } for tag in tags],
            },
        }

        res = await self.send_command(body, BlipCollectionResponse)
        if not res:
            return []
        
        return res
    
    async def get_queues(self) -> list:
        body = {
            "method": "get",
            "to": "postmaster@desk.msging.net",
            "uri": f"/attendance-queues?$skip=0&$take=999&$ascending=trues",
        }
        res = await self.send_command(body)
        if not res:
            return []
        
        return res.get("resource", {}).get("items", [])
    
    async def set_attendant_queues(self, attendant: str, queues: list[str]) -> None:
        body = {
            "method": "set",
            "to": "postmaster@desk.msging.net",
            "uri": "/attendants?userCulture=pt",
            "type": "application/vnd.lime.collection+json",
            "resource": {
                "itemType": "application/vnd.iris.desk.attendafnt+json",
                "items":[ 
                    {
                        "identity": f"{parse.quote(attendant)}@blip.ai",
                        "teams": queues,
                    }
                ]
            },
        }
        
        res = await self.send_command(body)
        return res

    async def get_attendants(self) -> list[Attendant]:
        body = {
            "method": "get",
            "to": "postmaster@desk.msging.net",
            "uri": "/agents/v2?$skip=0&$take=9999&includeStatus=false"
        }
        
        return [Attendant(**attendant) for attendant in (await self.send_command(body) or [])]


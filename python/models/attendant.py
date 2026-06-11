from pydantic import BaseModel, Field

class Attendant(BaseModel):
    identity: str
    fullName: str
    email: str
    teams: list[str] = Field(default_factory=list)
    agentSlots: int
    isEnabled: bool
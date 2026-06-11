from typing import Any, Dict, Generic, List, Literal, TypeVar, Union
from pydantic import BaseModel
from pydantic.generics import GenericModel


# Enums / Literal Types

Method = Literal["set", "get", "merge", "delete"]
Status = Literal["success", "failure"]

T = TypeVar("T")


# Generic Collection Response

class BlipCollectionResponse(GenericModel, Generic[T]):
    total: int
    itemType: str
    items: List[T]


# Success Response

class BlipSuccessfulResponse(GenericModel, Generic[T]):
    type: str
    resource: T
    method: Method
    status: Literal["success"]
    id: str
    from_: str
    to: str
    metadata: Dict[str, Any]

    model_config = {
        "populate_by_name": True
    }

    @classmethod
    def model_fields_aliases(cls):
        return {"from_": "from"}


# Error Response

class BlipErrorReason(BaseModel):
    code: int
    description: str


class BlipErrorResponseData(BaseModel):
    method: Method
    status: Literal["failure"]
    reason: BlipErrorReason
    id: str
    from_: str
    to: str
    metadata: Dict[str, Any]

    model_config = {
        "populate_by_name": True
    }

    @classmethod
    def model_fields_aliases(cls):
        return {"from_": "from"}


# Union Response

BlipCommandResponse = Union[
    BlipSuccessfulResponse[T],
    BlipErrorResponseData,
]


# Command Bodies

class BlipReadCommandBody(BaseModel):
    to: str
    method: Literal["get"]
    uri: str


class BlipDeleteCommandBody(BaseModel):
    to: str
    method: Literal["delete"]
    uri: str


class BlipWriteCommandBody(BaseModel):
    to: str
    method: Literal["set"]
    type: str
    resource: Dict[str, Any] | str
    uri: str


class BlipMessageBody(BaseModel):
    to: str
    content: Dict[str, Any] | str
    type: str
    metadata: Dict[str, Any] | None = None


BlipCommandBody = Union[
    BlipWriteCommandBody,
    BlipReadCommandBody,
    BlipDeleteCommandBody,
]
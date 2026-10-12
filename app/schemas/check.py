from sqlalchemy import Enum
import enum
class Priority(enum.Enum):
    high = 1
    medium = 2
    low = 3

print (Priority['high'].value)
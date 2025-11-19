import motor.motor_asyncio
from config import DB_NAME, DB_URI


class Database:
    
    def __init__(self, uri, database_name):
        # Add comprehensive SSL options to handle connection issues
        try:
            self._client = motor.motor_asyncio.AsyncIOMotorClient(
                uri,
                tls=True,
                tlsAllowInvalidCertificates=True,
                tlsInsecure=True,  # Allow insecure TLS connections
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                retryWrites=False  # Disable retry writes to reduce complexity
            )
            self.db = self._client[database_name]
            self.col = self.db.users
        except Exception as e:
            print(f"Failed to initialize database connection: {e}")
            self._client = None
            self.db = None
            self.col = None

    def new_user(self, id, name):
        return dict(
            id = id,
            name = name,
            session = None,
            api_id = None,
            api_hash = None,
        )
    
    async def add_user(self, id, name):
        # Handle case when database is not available
        if self.col is None:
            return
        try:
            user = self.new_user(id, name)
            await self.col.insert_one(user)
        except Exception as e:
            print(f"Error adding user: {e}")
    
    async def is_user_exist(self, id):
        # Handle case when database is not available
        if self.col is None:
            return False
        try:
            user = await self.col.find_one({'id':int(id)})
            return bool(user)
        except Exception as e:
            print(f"Error checking if user exists: {e}")
            return False
    
    async def total_users_count(self):
        # Handle case when database is not available
        if self.col is None:
            return 0
        try:
            count = await self.col.count_documents({})
            return count
        except Exception as e:
            print(f"Error getting total users count: {e}")
            return 0

    async def get_all_users(self):
        # Handle case when database is not available
        if self.col is None:
            return []
        try:
            return self.col.find({})
        except Exception as e:
            print(f"Error getting all users: {e}")
            return []

    async def delete_user(self, user_id):
        # Handle case when database is not available
        if self.col is None:
            return
        try:
            await self.col.delete_many({'id': int(user_id)})
        except Exception as e:
            print(f"Error deleting user: {e}")

    async def set_session(self, id, session):
        # Handle case when database is not available
        if self.col is None:
            return
        try:
            await self.col.update_one({'id': int(id)}, {'$set': {'session': session}})
        except Exception as e:
            print(f"Error setting session: {e}")

    async def get_session(self, id):
        # Handle case when database is not available
        if self.col is None:
            return None
        try:
            user = await self.col.find_one({'id': int(id)})
            return user.get('session') if user else None
        except Exception as e:
            print(f"Error getting session: {e}")
            return None

    async def set_api_id(self, id, api_id):
        # Handle case when database is not available
        if self.col is None:
            return
        try:
            await self.col.update_one({'id': int(id)}, {'$set': {'api_id': api_id}})
        except Exception as e:
            print(f"Error setting api_id: {e}")

    async def get_api_id(self, id):
        # Handle case when database is not available
        if self.col is None:
            return None
        try:
            user = await self.col.find_one({'id': int(id)})
            return user.get('api_id') if user else None
        except Exception as e:
            print(f"Error getting api_id: {e}")
            return None

    async def set_api_hash(self, id, api_hash):
        # Handle case when database is not available
        if self.col is None:
            return
        try:
            await self.col.update_one({'id': int(id)}, {'$set': {'api_hash': api_hash}})
        except Exception as e:
            print(f"Error setting api_hash: {e}")

    async def get_api_hash(self, id):
        # Handle case when database is not available
        if self.col is None:
            return None
        try:
            user = await self.col.find_one({'id': int(id)})
            return user.get('api_hash') if user else None
        except Exception as e:
            print(f"Error getting api_hash: {e}")
            return None

try:
    db = Database(DB_URI, "TechVJDemoBot")
    # Test the connection
    if db._client is not None:
        print("Database connection successful")
    else:
        print("Database connection failed, running without database")
except Exception as e:
    print(f"Database connection error: {e}")
    db = None

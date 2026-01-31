import { useSelector } from "react-redux";

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to CodeArena, {user?.username}!
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Your competitive coding platform
        </p>
        {user && (
          <div className="bg-white p-6 rounded-lg shadow-md inline-block">
            <h2 className="text-2xl font-semibold mb-3">Your Profile</h2>
            <div className="text-left space-y-2">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Role:</span> {user.role}</p>
              <p><span className="font-medium">Rating:</span> {user.rating || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen justify-center items-center bg-gray-900 text-gray-200">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">{children}</div>
      </div>
    </div>
  );
};
export default LoginLayout;

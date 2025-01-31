export default function ThankYouPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Cảm ơn!</h1>
      <p className="mb-4">Bạn đã hoàn toàn đăng xuất khỏi website.</p>
      <a href="/" className="text-blue-500 hover:text-blue-700">
        Quay về trang đăng nhập
      </a>
    </div>
  );
}

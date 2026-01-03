// /fod-del/asset/js/login_check.js
async function jsonAdminLogin(username, password) {
  const res = await fetch("/fod-del/asset/js/users.json");
  const data = await res.json();
  const users = Array.isArray(data.users) ? data.users : [];

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return { success: false, message: "Sai tài khoản hoặc mật khẩu!" };
  }

  // lưu vào localStorage để các trang khác biết
  localStorage.setItem("admin", JSON.stringify(user));
  localStorage.setItem("isAdminLoggedIn", "true");

  return { success: true, message: "Đăng nhập thành công!", user };
}

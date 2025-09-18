export async function getUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const response = await fetch(
    "https://api-dev.bharatgo.com/api/v1/vendor/dashboard",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return {
    name: data.vendor_name,
    phone: data.vendor_phone,
    email: data.vendor_email,
  };
}

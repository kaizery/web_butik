import { redirect } from "next/navigation";

// Endpoint /admin dinonaktifkan demi keamanan sesuai permintaan pemilik butik.
// Hak akses dialihkan ke URL khusus:
// - Kasir: /kasir
// - Super Admin: /portal-admin
export default function DeprecatedAdminPage() {
  redirect("/");
}

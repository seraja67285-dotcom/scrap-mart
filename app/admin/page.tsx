import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { addProduct, deleteProduct, toggleProduct, updateSettings, setupData, logout, updateOrderStatus, deleteOrder } from "./actions";

export const dynamic = "force-dynamic";

const badge: Record<string, string> = { NEW: "#168044", CONTACTED: "#b54708", DONE: "#667085" };

export default async function Admin() {
  const store = await cookies();
  if (!verifySession(store.get("admin_session")?.value)) redirect("/admin/login");

  const [products, categories, settings, orders] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "main" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const newOrders = orders.filter((o) => o.status === "NEW").length;

  return (
    <main className="container admin">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 32 }}>Admin Dashboard</h1>
        <form action={logout}><button className="btn dark">Logout</button></form>
      </div>

      <div className="grid" style={{ paddingTop: 0 }}>
        <div className="card body"><h3 style={{ margin: 0 }}>{products.length}</h3><p className="muted" style={{ margin: 0 }}>Total Products</p></div>
        <div className="card body"><h3 style={{ margin: 0 }}>{products.filter((p) => p.available).length}</h3><p className="muted" style={{ margin: 0 }}>Live Products</p></div>
        <div className="card body"><h3 style={{ margin: 0 }}>{orders.length}</h3><p className="muted" style={{ margin: 0 }}>Total Enquiries</p></div>
        <div className="card body"><h3 style={{ margin: 0 }}>{newOrders}</h3><p className="muted" style={{ margin: 0 }}>New Enquiries</p></div>
      </div>

      {categories.length === 0 && (
        <div className="card body" style={{ marginBottom: 18 }}>
          <h2>First-time setup</h2>
          <p className="muted">Database khali hai. Neeche button dabao — categories aur settings ban jayenge.</p>
          <form action={setupData}><button className="btn green">Setup Demo Data</button></form>
        </div>
      )}

      <div className="card body" style={{ marginBottom: 18 }}>
        <h2>Enquiries / Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="muted">Abhi koi enquiry nahi aayi. Customer buy/sell form bharega to yahan dikhegi.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Name</th><th>Phone</th><th>Item</th><th>Qty</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.createdAt.toLocaleDateString("en-IN")}</td>
                  <td>{o.type === "BUY" ? "🛒 Buy" : "📦 Sell"}</td>
                  <td>{o.name}</td>
                  <td><a href={`https://wa.me/${o.phone.replace(/\D/g, "")}`} target="_blank">{o.phone}</a></td>
                  <td>{o.item}</td>
                  <td>{o.quantity || "—"}</td>
                  <td><span className="badge" style={{ background: badge[o.status] || "#667085" }}>{o.status}</span></td>
                  <td>
                    <div className="row">
                      {o.status === "NEW" && (
                        <form action={updateOrderStatus}>
                          <input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="CONTACTED" />
                          <button className="btn dark" style={{ padding: "6px 10px" }}>Mark Contacted</button>
                        </form>
                      )}
                      {o.status === "CONTACTED" && (
                        <form action={updateOrderStatus}>
                          <input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="DONE" />
                          <button className="btn green" style={{ padding: "6px 10px" }}>Mark Done</button>
                        </form>
                      )}
                      <form action={deleteOrder}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="btn danger-btn" style={{ padding: "6px 10px" }}>Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card body" style={{ marginBottom: 18 }}>
        <h2>Site Settings</h2>
        <form action={updateSettings}>
          <label>Site Name</label>
          <input className="input" name="siteName" defaultValue={settings?.siteName || "ScrapMart"} />
          <label>WhatsApp Number (91XXXXXXXXXX)</label>
          <input className="input" name="whatsappNumber" defaultValue={settings?.whatsappNumber || ""} inputMode="numeric" />
          <button className="btn green">Save Settings</button>
        </form>
      </div>

      <div className="card body" style={{ marginBottom: 18 }}>
        <h2>Add New Scrap Product</h2>
        <form action={addProduct}>
          <label>Product Name</label>
          <input className="input" name="name" required placeholder="e.g. Old Iron Rods" />
          <label>Category</label>
          <select className="input" name="categoryId" required>
            <option value="">-- select --</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label>Description</label>
          <textarea name="description" rows={3} placeholder="Quality, quantity, location..."></textarea>
          <div className="row">
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Price (optional)</label>
              <input className="input" name="price" placeholder="e.g. ₹35" />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Unit (optional)</label>
              <input className="input" name="unit" placeholder="e.g. kg" />
            </div>
          </div>
          <label>Image URL (optional)</label>
          <input className="input" name="imageUrl" type="url" placeholder="https://...jpg" />
          <button className="btn green">Add Product</button>
        </form>
      </div>

      <div className="card body">
        <h2>Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="muted">Abhi koi product nahi hai. Upar form se add karo.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category.name}</td>
                  <td>{p.price || "—"}</td>
                  <td>{p.available ? "Available" : "Hidden"}</td>
                  <td>
                    <div className="row">
                      <form action={toggleProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="available" value={String(!p.available)} />
                        <button className="btn dark" style={{ padding: "6px 10px" }}>{p.available ? "Hide" : "Show"}</button>
                      </form>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="btn danger-btn" style={{ padding: "6px 10px" }}>Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconUsers } from "@tabler/icons-react";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";

interface SP {
  search?: string;
  role?: string;
}

export const dynamic = "force-dynamic";

const ROLE_TONES = {
  ADMIN: "orange",
  GRAPHICS: "purple",
  PRINTER: "blue",
  CUSTOMER: "neutral",
} as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const session = await auth();
  const callerId = session!.user.id;

  const where: Prisma.UserWhereInput = {};
  const search = searchParams.search?.trim();
  const role = searchParams.role?.trim();

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (
    role === "ADMIN" ||
    role === "GRAPHICS" ||
    role === "PRINTER" ||
    role === "CUSTOMER"
  ) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      phone: true,
      _count: { select: { orders: true, designs: true } },
    },
  });

  const totalCount = await prisma.user.count();

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ADMIN / USERS
      </span>
      <h1 className="h2 mt-3 text-text-primary">Users</h1>
      <p className="mt-2 text-sm text-text-muted">
        {totalCount} total {totalCount === 1 ? "user" : "users"}. Promote
        members to Graphics, Printer, or Admin as needed.
      </p>

      {/* Filters */}
      <form
        className="mt-8 flex flex-wrap items-end gap-3"
        action="/admin/users"
        method="get"
      >
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Role
          </label>
          <select
            name="role"
            defaultValue={role ?? ""}
            className="h-10 rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="GRAPHICS">Graphics</option>
            <option value="PRINTER">Printer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="min-w-[240px] flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Search
          </label>
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Name or email"
            className="h-10 w-full rounded-input border border-border bg-white px-3 text-sm placeholder:text-text-hint focus:border-text-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-btn bg-text-primary px-5 text-sm font-semibold text-white transition hover:bg-orange"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 text-xs text-text-muted">
        Showing {users.length} of {totalCount}
      </div>

      <div className="mt-3">
        {users.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={22} />}
            title="No users match these filters"
            body="Try resetting the filters above."
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">User</th>
                  <th className="px-4 py-3 text-left font-semibold">Joined</th>
                  <th className="px-4 py-3 text-left font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold">Designs</th>
                  <th className="px-4 py-3 text-left font-semibold">Current role</th>
                  <th className="px-4 py-3 text-left font-semibold">Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === callerId;
                  return (
                    <tr
                      key={u.id}
                      className="border-t border-border transition hover:bg-bg-page"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">
                          {u.name}
                          {isSelf && (
                            <span className="ml-2 text-[10px] uppercase tracking-widest text-orange">
                              you
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted">{u.email}</div>
                        {u.phone && (
                          <div className="text-xs text-text-muted">{u.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {u._count.orders}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {u._count.designs}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={ROLE_TONES[u.role]} className="uppercase">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <UserRoleSelect
                          userId={u.id}
                          current={u.role}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminIndex() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid gap-3">
        <a className="card block" href="/admin/news">
          <div className="font-medium">News</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Create and edit news posts</div>
        </a>
        <a className="card block" href="/admin/weeks">
          <div className="font-medium">Lehrplan</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Create and edit weeks</div>
        </a>
        <a className="card block" href="/admin/invites">
          <div className="font-medium">Invites</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Manage invite codes</div>
        </a>
        <a className="card block" href="/admin/surveys">
          <div className="font-medium">Surveys</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Create surveys and questions</div>
        </a>
      </div>
    </div>
  );
}



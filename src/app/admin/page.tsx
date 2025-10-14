export default function AdminIndex() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid gap-3">
        <a className="card block" href="/admin/news">
          <div className="font-medium">News</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">News-Beiträge erstellen und bearbeiten</div>
        </a>
        <a className="card block" href="/admin/weeks">
          <div className="font-medium">Lehrplan</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Wochen erstellen und bearbeiten</div>
        </a>
        <a className="card block" href="/admin/invites">
          <div className="font-medium">Einladungen</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Einladungscodes verwalten</div>
        </a>
        <a className="card block" href="/admin/surveys">
          <div className="font-medium">Umfragen</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Umfragen und Fragen erstellen</div>
        </a>
        <a className="card block" href="/admin/surveys/results">
          <div className="font-medium">Umfrageergebnisse</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Aggregationen ansehen und CSV exportieren</div>
        </a>
      </div>
    </div>
  );
}



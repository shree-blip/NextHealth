interface Category { name: string }
interface Tag { name: string }

interface Props {
  categories?: Category[];
  tags?: Tag[];
}

export default function CategoriesTags({ categories = [], tags = [] }: Props) {
  if (categories.length === 0 && tags.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200">
      {categories.length > 0 && (
        <div className="flex items-center">
          <strong className="mr-1">Categories:</strong>
          {categories.map((c) => (
            <span key={c.name} className="mr-2 text-blue-600 dark:text-blue-400 hover:underline">
              {c.name}
            </span>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex items-center">
          <strong className="mr-1">Tags:</strong>
          {tags.map((t) => (
            <span key={t.name} className="mr-2 text-green-600 dark:text-green-400 hover:underline">
              {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

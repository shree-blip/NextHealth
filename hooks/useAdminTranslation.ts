import { useAdminPreferences } from './admin-context';
import { t as translateKey } from './admin-translations';

export function useAdminTranslation() {
  const { preferences } = useAdminPreferences();
  
  return (key: string) => translateKey(key, preferences.language);
}

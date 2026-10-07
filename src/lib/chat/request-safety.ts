/** Conservative request filter for attempts to extract private system data. */
export function isSensitiveChatRequest(message: string) {
  return /(?:system\s+prompt|api\s*key|environment\s+variables?|private\s+(?:database|user|account)?\s*data|secret\s+key|clé\s+(?:api|secrète)|instructions?\s+(?:internes|système)|données\s+privées|مفتاح\s*(?:api|الواجهة)?|المتغيرات\s*البيئية|التعليمات\s*(?:الداخلية|النظام)|البيانات\s*الخاصة)/iu.test(message)
    || /(?:ignore|reveal|show|print|display|révèle|montre|affiche|تجاهل|اكشف|أظهر|اعرض).{0,80}(?:prompt|key|secret|environment|private|تعليمات|مفتاح|أسرار|بيانات)/iu.test(message);
}

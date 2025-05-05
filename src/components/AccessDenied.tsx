export default function AccessDenied() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-600">אין לך גישה</h1>
      <p className="mt-4 text-gray-700">
        אין לך הרשאה לצפות בדף זה. אנא פנה למנהל המערכת אם אתה חושב שזו טעות.
      </p>
    </div>
  );
}

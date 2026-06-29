// Validasi ringan untuk form auth. Bukan schema-based (sudah ditinggalkan);
// ini set fungsi-fungsi kecil yang return string error atau null.
// Return null = valid; string = pesan error (Bahasa Indonesia default).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const v = (value ?? "").trim();
  if (!v) return "Email wajib diisi.";
  if (!EMAIL_RE.test(v)) return "Format email tidak valid.";
  return null;
}

export function validatePassword(value) {
  const v = value ?? "";
  if (!v) return "Password wajib diisi.";
  if (v.length < 8) return "Password minimal 8 karakter.";
  return null;
}

export function validateName(value) {
  const v = (value ?? "").trim();
  if (!v) return "Nama wajib diisi.";
  return null;
}

// Validasi semua field sekaligus. Return {field: errorMessage|undefined}.
// Berguna untuk disable tombol submit saat ada error.
export function validateAuthForm({ name, email, password, isRegister }) {
  const errors = {};
  if (isRegister) {
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;
  }
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;
  return errors;
}
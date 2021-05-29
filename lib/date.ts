const offset = (-9 * 60 - new Date().getTimezoneOffset()) * 60 * 1000;

export const formatDate = (dateStr?: string | null): string => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setTime(d.getTime() - offset); // JSTにする
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

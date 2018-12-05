/*
 * Handy utilities
 */

/*
 * Return today's date in YYYY-mm-dd
 */
const today = () => {
  const now = new Date()

  const year = now.getFullYear().toString();
  const month = (now.getMonth()+1).toString().padStart(2,'0');
  const day = now.getDate().toString().padStart(2,'0');

  return `${year}-${month}-${day}`
}

export {today}

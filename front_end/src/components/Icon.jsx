/* ---------- icons ---------- */
const P={
  swap:"M7 7h12l-3-3M17 17H5l3 3",
  send:"M12 19V5M5 12l7-7 7 7",
  copy:"M9 9h10v11H9zM5 15V4h10",
  check:"M5 12l5 5 9-10",
  panel:"M4 5h16v14H4zM9 5v14",
  panelR:"M4 5h16v14H4zM15 5v14",
  plus:"M12 5v14M5 12h14",
  pin:"M9 4h6l-1 6 3 3H7l3-3zM12 13v7",
  trash:"M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  retry:"M20 12a8 8 0 11-3-6.2M20 4v5h-5",
  search:"M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4"
};
export const Icon=({n})=><svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={P[n]}/></svg>;

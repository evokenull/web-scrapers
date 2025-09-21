import fetch from "node-fetch";

async function normalPagination(page) {
  const res = await fetch("https://testapi.com/page=1&limit=10");
  const data = await res.json();
}

async function cursorBasedPagination(page) {
  const res = await fetch("https://testapi.com");
  const data = await res.json();
  const cursor = data.cursor;

  while (cursor) {
    const res = await fetch(`https://testapi.com?cursor=${cursor}`);
    const data = await res.json();
    cursor = data.cursor;
  }
}

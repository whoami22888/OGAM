
"use strict";
function listNotes() { return Promise.resolve([]); }
function getNote() { return Promise.resolve(null); }
function saveNote() { return Promise.resolve(); }
function deleteNote() { return Promise.resolve(); }
module.exports = { listNotes, getNote, saveNote, deleteNote };

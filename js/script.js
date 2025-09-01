// *notes app
const noteFilter = document.querySelector('.note-app-filter')
const forma = document.querySelector('.note-app__forma--create')
const noteInput = document.querySelector('.note-app__input--create')
const noteList = document.querySelector('.note-app__list')
const API_URL = 'https://689336d1c49d24bce869dec5.mockapi.io/Users/1/Notes'
let notes = []
function renderNote() {
  noteList.innerHTML = ''
  notes.forEach(note => {
    const cssClass = note.done ? 'note__text note__text--done' : 'note__text'
    const noteHTML = `<li id="${note.id}" class="note-app__item note">
                  <div class="note__main">
                    <span  class="${cssClass}">${note.text}</span>
                    <div class="note__btns">
                      <button type="button" data-action="edit" data-note-id="${note.id}" class="note__btn note__btn--edit">
                        &#10000;
                      </button>
                      <button type="button" data-action="status" data-note-id="${note.id}" class="note__btn note__btn--done">
                        &#x2714;
                      </button>
                      <button type="button" data-action="delete" data-note-id="${note.id}" class="note__btn note__btn--delete">
                        &#10008;
                      </button>
                    </div>
                  </div>
                </li>`
    noteList.insertAdjacentHTML('beforeend', noteHTML)
  })
  const textNote = document.querySelectorAll('.note__text')
  textNote.forEach(textElem => {
    if (textElem.classList.contains('note__text--done')) {
      const parentTag = textElem.closest('li')
      block(parentTag)
    }
  })
}
const getNoteAsync = async () => {
 noteList.insertAdjacentHTML('beforeend', `<p class="loading">Загрузка..</p>`)
  try {
    const response = await fetch(API_URL)
    notes = await response.json()
    renderNote()
  } catch (error) {
    noteList.innerHTML = ""
    noteList.insertAdjacentHTML('beforeend', `<p class="error"> Ошибка: Не удалось загрузить ресурс</p>`)
  }
}
getNoteAsync()

forma.addEventListener('submit', createNote)
noteList.addEventListener('click', updateNote)
noteList.addEventListener('click', statusNote)
noteList.addEventListener('click', deleteNote)

const createNoteAsync = async newDataNote => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(newDataNote),
      headers: {
        'Content-type': 'application/json',
      },
    })
    const newNote = await response.json()
    notes.push(newNote)
    renderNote()
    forma.reset()
  } catch (error) {
    console.log(error.message)
  }
}
const updateNoteAsync = async newDataNote => {
  try {
    const response = await fetch(`${API_URL}/${newDataNote.id}`, {
      method: 'PUT',
      body: JSON.stringify(newDataNote),
      headers: {
        'Content-type': 'application/json',
      },
    })
    const editNote = await response.json()
    if (response.status === 400) {
      throw new Error(`Клиентская ошибка`)
    }
    notes = notes.map(note => {
      if (note.id === editNote.id) {
        return editNote
      } else {
        return note
      }
    })
    const li = document.getElementById(editNote.id)
    const textEl = li.querySelector('.note__text')
    textEl.textContent = editNote.text
    textEl.style.display = 'block'

    const form = li.querySelector('.note-app__forma--save')
    if (form) form.remove()
    li.querySelectorAll('.note__btn').forEach(btn => {
      btn.removeAttribute('disabled')
      btn.style.cursor = 'pointer'
      btn.style.backgroundColor = 'var(--default-color-ui-elements)'
    })
  } catch (error) {
    console.log(error.message)
  }
}
const doneNoteAsync = async noteId => {
  try {
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({
        done: true,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    })
    const doneNote = await response.json()
    notes = notes.map(note => {
      if (note.id === doneNote.id) {
        return doneNote
      } else {
        return note
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}
const noDoneActiveNoteAsync = async noteId => {
  try {
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({
        done: false,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    })
    const doneNote = await response.json()
    notes = notes.map(note => {
      if (note.id === doneNote.id) {
        return doneNote
      } else {
        return note
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}
const deleteNoteAsync = async noteId => {
  try {
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'DELETE',
    })
    if (response.status === 404) {
      throw new Error(`${noteId} Не найден`)
    }
    const deleteNote = await response.json()
    notes = notes.filter(note => {
      if (note.id !== deleteNote.id) {
        return true
      }
    })
    renderNote()
  } catch (error) {
    noteList.insertAdjacentHTML('beforeend', `<p class="error"> Error: ${error.message}</p>`)
  }
}
function createNote(e) {
  e.preventDefault()
  const fornData = new FormData(forma)
  const formDataNote = Object.fromEntries(fornData)
  const newDataNote = {
    text: formDataNote.noteText,
    done: false,
  }
  if (noteInput.value.trim() === '') {
    noteInput.style.borderColor = 'var(--error-color)'
    noteInput.focus()
  } else {
    createNoteAsync(newDataNote)
    noteInput.style.borderColor = 'var(--focus-color)'
  }
  noteFilter.value = 'Все'
}
function updateNote(e) {
  if (e.target.dataset.action === 'edit') {
    const parentTag = e.target.closest('li')
    const noteId = e.target.dataset.noteId
    const noteTextContent = parentTag.querySelector('.note__text')
    const noteHTML = `
  <form action="#" class="note-app__forma note-app__forma--save">
          <input hidden type="text" name="noteId" value="${noteId}" />
          <input type="text" name="noteText" placeholder="Введите текст" value="" class="note-app__input note-app__input--save" />
          <button class="note-app__button note-app__button--save" type="submit">&uarr;</button>
    </form>`
    parentTag.insertAdjacentHTML('beforeend', noteHTML)
    const noteBtns = parentTag.querySelectorAll('.note__btn')
    if (parentTag.querySelector('.note-app__forma--save')) {
      noteTextContent.style.display = 'none'
      noteBtns.forEach(btn => {
        btn.style.backgroundColor = 'var(--default-color-ui-elements)'
        btn.setAttribute('disabled', 'true')
        btn.style.cursor = 'auto'
      })
    } else {
      noteTextContent.style.display = 'block'
      noteBtns.forEach(btn => {
        btn.removeAttribute('disabled', 'true')
        btn.style.cursor = 'pointer'
      })
    }
    const noteEditForma = parentTag.querySelector('.note-app__forma--save')
    const noteEditInput = parentTag.querySelector('.note-app__input--save')
    noteEditInput.value = noteTextContent.textContent
    noteEditInput.focus()
    noteEditForma.addEventListener('submit', e => {
      e.preventDefault()
      if (noteEditInput.value.trim() === '') {
        noteEditInput.style.borderColor = 'var(--error-color)'
        noteEditInput.focus()
      } else {
        const fornData = new FormData(noteEditForma)
        const formDataNote = Object.fromEntries(fornData)
        const newDataNote = {
          id: formDataNote.noteId,
          text: formDataNote.noteText,
          done: false,
        }
        updateNoteAsync(newDataNote)
      }
    })
  }
}
function statusNote(e) {
  if (e.target.dataset.action === 'status') {
    const parentTag = e.target.closest('li')
    const noteText = parentTag.querySelector('.note__text')
    noteText.classList.toggle('note__text--done')
    const noteId = e.target.dataset.noteId
    if (noteText.classList.contains('note__text--done')) {
      block(parentTag)
      doneNoteAsync(noteId)
    } else {
      unlock(parentTag)
      noDoneActiveNoteAsync(noteId)
    }
  }
}
function block(tag) {
  const noteEditBtn = tag.querySelector('.note__btn--edit')
  noteEditBtn.setAttribute('disabled', 'true')
  noteEditBtn.style.backgroundColor = 'var(--done-note-color)'
  noteEditBtn.style.cursor = 'auto'
}
function unlock(tag) {
  const noteEditBtn = tag.querySelector('.note__btn--edit')
  noteEditBtn.removeAttribute('disabled', 'true')
  noteEditBtn.style.backgroundColor = 'var(--default-color-ui-elements)'
  noteEditBtn.style.cursor = 'pointer'
}
function deleteNote(e) {
  if (e.target.dataset.action === 'delete') {
    const noteId = e.target.dataset.noteId
    deleteNoteAsync(noteId)
  }
}

noteFilter.addEventListener('change', () => {
  const noteElements = document.querySelectorAll('.note')
  if (noteFilter.value === 'Все') {
    noteElements.forEach(note => {
      note.style.display = 'block'
    })
  } else if (noteFilter.value === 'Активные') {
    noteElements.forEach(note => {
      note.style.display = 'none'
    })
    const noteActive = notes.filter(note => {
      return note.done === false
    })
    noteActive.forEach(note => {
      const htmlElement = document.getElementById(note.id)
      htmlElement.style.display = 'block'
    })
  } else if (noteFilter.value === 'Выполнные') {
    noteElements.forEach(note => {
      note.style.display = 'none'
    })
    const noteDone = notes.filter(note => {
      return note.done === true
    })
    noteDone.forEach(note => {
      const htmlElement = document.getElementById(note.id)
      htmlElement.style.display = 'block'
    })
  }
})


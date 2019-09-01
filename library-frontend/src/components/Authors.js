import React, { useState } from 'react'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  if (!props.show) {
    return null
  }
  if (props.result.loading) {
    return <div>loading...</div>
  }

  const authors = props.result.data.allAuthors

  const editBorn = async (e) => {
    e.preventDefault()
    const setBornTo = born

    await props.editAuthor({
      variables: { name, setBornTo }
    })
    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {props.user &&
        <div>
          <h3>Set birthyear</h3>
          <form onSubmit={editBorn}>
            <div>
              name
              <select
                value={name}
                onChange={({ target }) => setName(target.value)}
              >
                <option value=''>--Choose author--</option>
                {authors.map(a => {
                  return (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  )
                })}
              </select>
            </div>
            <div>
              born
              <input 
                value={born}
                onChange={({ target }) => setBorn(parseInt(target.value))}
              />
            </div>
            <button type='submit'>update author</button>
          </form>
        </div>
      }
    </div>
  )
}

export default Authors
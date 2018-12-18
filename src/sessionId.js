/*
 * Get/Set the sessionId from localStorage. It may also be
 * provided as an environment variable, but look in localStorage first.
 */

export function getSessionId() { 
  const id = localStorage.getItem('sessionId')

  if(id) 
    return id
  else
    return process.env['REACT_APP_SESSION_ID'] || ''
}

export function hasSessionId() { return getSessionId() !== '' }

export function setSessionId(x) { return localStorage.setItem('sessionId',x)}
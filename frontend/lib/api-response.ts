import { NextResponse } from "next/server"

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message = "Invalid request") {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function unauthorized(message = "Authentication required") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = "Admin access required") {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverError(message = "Something went wrong") {
  return NextResponse.json({ error: message }, { status: 500 })
}

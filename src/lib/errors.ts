export function serverFault(comment: string) {
    return Response.json({
        "status": "500",
        "message": `holy crap please scream at windy this is NOT supposed to happen (${comment})`
    }, { status: 500 })
}

export function notFound(comment: string) {
    return Response.json({
        "status": "404",
        "message": `not found (${comment})`
    }, { status: 404 })
}


export function yourFault(comment: string) {
    return Response.json({
        "status": "400",
        "message": `your fault!! (${comment})`
    }, { status: 400 })
}

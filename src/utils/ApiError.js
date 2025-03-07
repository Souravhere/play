class ApiError extends Error {
    constructor(
        statusCode,
        messge = 'Something went wrong',
        errors = [],
        statck = ""
    ){
        super(messge)
        this.statusCode = statusCode
        this.data = null
        this.message = messge
        this.success = false
        this.errors = errors

        if (statck) {
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }
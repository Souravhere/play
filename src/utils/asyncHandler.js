const asyncHandler = (requestHandler) => {
    (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}

/*
This is the another way with try catch 

const asyncHandlers = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            sucess: false,
            message: err.message 
        })
    }
}

export {asyncHandlers}
*/

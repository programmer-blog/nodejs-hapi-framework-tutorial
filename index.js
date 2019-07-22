const hapi = require('hapi');
const joi = require('joi');
const mongoose = require('mongoose');

const server = new hapi.Server({"host":"localhost", "port": 3000});

/* MongoDb connection */
mongoose.connect("mongodb://localhost/dbbooks", { useNewUrlParser: true });

const BookModel = mongoose.model("book", {
    title: String,
    price: Number,
    author: String,
    category: String
});

server.route({
    method:"GET",
    path:"/book",
    handler: async (request, resp) => {
        try{
           let books = await BookModel.find().exec();
           return resp.response(books);
        } catch(error) {
           return resp.response(error).code(500);
        }
    }
});

server.route({
    method:"GET",
    path:"/book/{id}",
    handler: async (request, resp) => {
        try{
           let book = await BookModel.findById(request.params.id).exec();
           return resp.response(book);
        } catch(error) {
           return resp.response(error).code(500);
        }
    }
});

server.route({
    method:"POST",
    path:"/book",
    options: {
        validate: {
            payload:{
              title: joi.string().required(),
              price: joi.number().required(),
              author: joi.string(),
              category: joi.string().required()
            }, 
            failAction: (request, resp, error) => {
                return error.isJoi ? resp.response(error.details[0]).takeover() : resp.response(error).takeover();
            }
        }
    },
    handler: async (request, resp) => {
        try{
           let book = new BookModel(request.payload);
           let result = await book.save();
           return resp.response(result);
        } catch(error) {
           return resp.response(error).code(500);
        }
    }
});

server.route({
    method:"PUT",
    options: {
        validate: {
            payload:{
              title: joi.string().optional(),
              price: joi.number().optional(),
              author: joi.optional(),
              category: joi.string().optional()
            }, 
            failAction: (request, resp, error) => {
                return error.isJoi ? resp.response(error.details[0]).takeover() : resp.response(error).takeover();
            }
        }
    },
    path:"/book/{id}",
    handler: async (request, resp) => {
        try{
          let result = await BookModel.findByIdAndUpdate(request.params.id, request.payload, {new : true});
          return resp.response(result);
        } catch(error) {
           return resp.response(error).code(500);
        }
    }
});

server.route({
    method:"DELETE",
    path:"/book/{id}",
    handler: async (request, res) => {
        try{
            let result = await BookModel.findByIdAndDelete(request.params.id);
            return res.response(result);
        } catch(error) {
           return resp.response(error).code(500);
        }
    }
});

server.start(err => {
    if(err){
        throw err;
    }

    console.log('Server started')
});

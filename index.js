const Hapi=require('hapi');
const Joi=require('joi');
const Mongoose=require('mongoose');
var server=new Hapi.Server({
    'host':'localhost',
    'port':3000
});
Mongoose.connect('mongodb://localhost:27017/hapiApi',{useNewUrlParser:true, useUnifiedTopology: true });
const personModel=Mongoose.model("person",
{
    firstname:String,
    lastname:String,
    email:String
});
server.route({
    method:'POST',
    path:'/person',
    options:{
        validate:{
            payload:{
            firstname: Joi.string().min(3).required(),
            lastname: Joi.string().required()
            },
            failAction:(request,h,error)=>
            {
                return error.isJoi?h.response(error.details[0]).takeover():h.response(error).takeover();
               
             } 
            }
        },
    
    handler:async(request,h)=>
    {
  try {
var person=new personModel(request.payload);
var result=await person.save();
return h.response({userDetails:result});
    }
    catch(error)
    {
      return h.response(error).code(500);
    }
} 
 });
 server.route({
     method:"GET",
     path:'/people',
     handler:async(request,h)=>
     {
         try{
          var people=await personModel.find().exec();
        return h.response(people); 
        }
         catch(error)
         {
return h.response(error).code(500);
         }
     }
 });
 server.route({
    method:"GET",
    path:'/person/{id}',
    handler:async(request,h)=>
    {
        try{
         var person=await personModel.findById({_id:request.params.id}).exec();
       return h.response(person); 
       }
        catch(error)
        {
return h.response(error).code(500);
        }
    }
});
server.route({
    method:"PUT",
    path:'/person/{id}',
    options:{
        validate:{
            payload:{
                firstname:Joi.string().min(3).optional(),
                lastname:Joi.string()
            },
            failAction:function(request,h,error)
            {
         return error.isJoi?h.response(error.details[0]).takeover():h.response(error).takeover();
            }
        },
       
    
    },
    handler:async(request,h)=>
    {
        try{
        var person=await personModel.findByIdAndUpdate(request.params.id,request.payload,{new:true});
        return h.response(person);
       }
        catch(error)
        {
return h.response(error).code(500);
        }
    }
});
server.route({
    method:"DELETE",
    path:'/person/{id}',
   
    handler:async(request,h)=>
    {
        try{
        var person=await personModel.findByIdAndDelete(request.params.id);
        return h.response(person);
       }
        catch(error)
        {
return h.response(error).code(500);
        }
    }
});
   
server.start((err)=>
{
    if(err) throw err;
    console.log('server started ... ' );
});
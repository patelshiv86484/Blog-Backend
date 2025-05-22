import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";//as lots of Image will be there so can't load all at once so we will use pagination to reduce the load on Database.

const imageSchema=new Schema({
    imageFile:{
        type:String,//Cloudinary url
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    status:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true,})
imageSchema.plugin(mongooseAggregatePaginate);
export const Image=mongoose.model("Image",imageSchema);
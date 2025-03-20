import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
  {
    videoFile: { 
      type: String,   // cloudnary url
      required: true,
    },

    thumbnail: {    // cloudnary url
        type: String,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      discription: {
        type: String,
        required: true,
      },

    //   ye bhi cloudnary dega
      duration : {
        type: Number ,
        required: true,
      },

      views : {
        type: Number ,
        default: 0,
      },

      isPublished : {
        type: Boolean ,
        default: true,
      },

      owner : {
        type: Schema.Types.ObjectId ,
        ref: "User",
      }
  },
  {
    timestamps: true,
  }
);

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", VideoSchema);

import mongoose, { Schema } from "mongoose";
import * as memberEnums from "../libs/enums/member.enums";

const MemberStatus =
  (memberEnums as any).MemberStatus ??
  (memberEnums as any).MemberStatusEnum ??
  (memberEnums as any).default?.MemberStatus ??
  (memberEnums as any).default?.MemberStatusEnum;
const MemberType =
  (memberEnums as any).MemberType ??
  (memberEnums as any).MemberTypeEnum ??
  (memberEnums as any).default?.MemberType ??
  (memberEnums as any).default?.MemberTypeEnum;

const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },
    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberPassword: {
      type: String,
      select: false,
      required: true,
    },
    memberAddress: {
      type: String,
    },

    memberDesc: {
      type: String,
    },

    memberImage: {
      type: String,
    },

    memberPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
  // updatedAt, createdAt
);

export default mongoose.model("Member", memberSchema);

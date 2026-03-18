import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export const uploadFeedImage = async (
  assetId: string,
  userId: string,
): Promise<string> => {
  // get local file URI from asset ID
  const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
  const localUri = assetInfo.localUri || assetInfo.uri;

  const fileExt = localUri.split(".").pop() || "jpg";
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Read the image file as base64 using the new expo-file-system API
  const file = new File(localUri);
  const base64 = await file.base64();

  const arrayBuffer = decode(base64);

  const { data, error } = await supabase.storage
    .from("feed_images")
    .upload(fileName, arrayBuffer, {
      contentType: `image/${fileExt.toLowerCase() === "png" ? "png" : "jpeg"}`,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("feed_images").getPublicUrl(fileName);

  return publicUrl;
};

export interface CreatePostParams {
  userId: string;
  groupId: string | null;
  content: string;
  images: string[];
  visibility: "public" | "group";
}

export const createPost = async (params: CreatePostParams) => {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: params.userId,
      group_id: params.groupId,
      content: params.content,
      images: params.images,
      visibility: params.visibility,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

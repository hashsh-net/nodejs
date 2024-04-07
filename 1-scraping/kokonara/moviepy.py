from moviepy.config import change_settings
from moviepy.editor import *
import os

# ImageMagickのバイナリパスを設定
change_settings({"IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"})

# フォントのパス
font_path = r"C:/Windows/Fonts/msgothic.ttc"
font_size = 120

# テキストの装飾
text_color = "rgb(195,40,110)"
# 縁取り内側
stroke_in_color = "rgb(255,255,255)"
stroke_in_width = 0
# 縁取り外側
stroke_out_color = "rgb(255,255,255)"
stroke_out_width = 15

# テキストの位置を決定（Y軸方向だけ）
text_Y = 400
# 若干位置ずれするので補正
delta_Y = 8

# フォルダ内の動画ファイルのパス
input_folder = r"C:\Users\tuna0514\Desktop\uploadsuruyatu"
output_folder = r"C:\Users\tuna0514\Desktop\uwsc5302"

# フォルダ内の動画ファイルを取得
video_files = [f for f in os.listdir(input_folder) if f.endswith(".mp4")]

for video_file in video_files:
    input_path = os.path.join(input_folder, video_file)
    output_path = os.path.join(output_folder, video_file)

    clip = VideoFileClip(input_path)
    
    # 動画を時計回りに10度回転
    rotated_clip = clip.rotate(10)
    
    # 左右反転
    flipped_clip = rotated_clip.fx(vfx.mirror_x)
    
    # 入力するテキストの指定
    text = u"削除された\n伝説動画"
    
    txtclip_out = TextClip(text, 
                       font = font_path,
                       fontsize=font_size, 
                       color=text_color,
                       stroke_color=stroke_out_color,
                       stroke_width=stroke_out_width
                      )
    # 縁取り内側
    txtclip_in = TextClip(text, 
                       font = font_path,
                       fontsize=font_size, 
                       color=text_color,
                       stroke_color=stroke_in_color,
                       stroke_width=stroke_in_width
                      )

    cvc = CompositeVideoClip([flipped_clip, txtclip_out.set_position(("center",text_Y)),
                             txtclip_in.set_position(("center",text_Y + delta_Y))])

    output_clip = cvc.set_duration(flipped_clip.duration)
    output_clip.write_videofile(output_path, codec="libx264")
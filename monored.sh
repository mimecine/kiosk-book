#!/usr/bin/env bash

filename=$1
output=$2
# if ["x$output" = "x"]; then
#     output=${1/.jpg/_red.jpg}
# fi
echo "Processing $filename to $output"


magick $filename -colorspace gray -brightness-contrast "0x20" +level-colors "red,rgb(255,220,220)" $output

#magick convert "$1" -colorspace gray -brightness-contrast "0x20" +level-colors red, "$2"

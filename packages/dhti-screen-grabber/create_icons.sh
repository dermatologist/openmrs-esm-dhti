#!/bin/bash

# Create a simple green square PNG for 16x16
echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGklEQVR42mNk+M+AFzAyMjKQhoaGBgbSAQBqCgEBlLq6sQAAAABJRU5ErkJggg==" | base64 -d > icon16.png

# Create a simple green square PNG for 48x48
echo "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGklEQVR42mNk+M+AFzAyMjKQhoaGBgbSAQBqCgEBlLq6sQAAAABJRU5ErkJggg==" | base64 -d > icon48.png

# Create a simple green square PNG for 128x128
echo "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGklEQVR42mNk+M+AFzAyMjKQhoaGBgbSAQBqCgEBlLq6sQAAAABJRU5ErkJggg==" | base64 -d > icon128.png

echo "Icons created successfully"

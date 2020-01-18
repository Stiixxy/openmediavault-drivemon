BUILD_DIR := bin

all:
	mkdir -p $(BUILD_DIR)
	gcc src/get_hdparm.c -o $(BUILD_DIR)/get_hdparm
BUILD_DIR := bin

all:
	mkdir -p $(BUILD_DIR)
	rm $(BUILD_DIR)/get_hdparm
	gcc src/get_hdparm.c -o $(BUILD_DIR)/get_hdparm
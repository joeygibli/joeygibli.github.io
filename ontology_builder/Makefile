VPATH:=../so-wp-connections/wp-redo

linkcats.csv: legit-categories.txt
	sed '1 s/^\s*/value,name\n/;s/^\s*//;s/ /,/' $< > $@
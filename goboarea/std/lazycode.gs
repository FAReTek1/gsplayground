# Module that lets you be lazy by reducing the simplest codeblocks into macros or procs etc

# goofy name
%define WAIT_FOR_KPRESS_RELEASE(key) wait_until key_pressed(key); wait_until not key_pressed(key);
%define WAIT_FOR_BOOL(bool) wait_until bool; wait_until not bool;

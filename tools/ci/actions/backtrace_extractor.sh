while true; do
    ps axf | grep ocaml | grep -v grep | awk '{ system("sudo gdb -ex \"set pagination 0\" -ex \"thread apply all bt\" -batch /proc/"$1"/exe -p "$1" 2> /dev/null")}' > /tmp/last_backtrace.txt
    sleep 60
done

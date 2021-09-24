#!/bin/env bash

while true; do
    ps -e -o "%p," -o "%a" | grep ocaml | grep -v grep | awk -F , '{ system("date +\"%T\" >> /tmp/last_backtrace.txt; echo \""$2"\" >> /tmp/last_backtrace.txt; sudo gdb -ex \"source tools/ci/actions/gdb_commands\" -batch /proc/"$1"/exe -p "$1" 2> /dev/null")}' >> /tmp/last_backtrace.txt
    sleep 120
done

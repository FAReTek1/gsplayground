%include std\\char.gs
costumes "blank.svg";

onflag {
    ask "char1: ";
    c1 = answer();
    ask "char2: ";
    say check(c1, answer());
}
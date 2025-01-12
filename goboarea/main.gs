%include std\\shapefill.gs
costumes "blank.svg";

onflag {
    forever {
        erase_all;
        RESET_POS;
        fill_cone my_pos(), mouse_x();
    }
}
def wrap_return(filepath, return_line_num, spaces):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    start_idx = return_line_num - 1
    
    # insert <LockedFeature>
    indent = " " * spaces
    lines.insert(start_idx + 1, indent + "  <LockedFeature>\n")
    
    # find the matching closing tag or just put it before the last line
    # usually these files end with `  );\n}\n`
    for i in range(len(lines)-1, -1, -1):
        if lines[i].strip() == ");":
            lines.insert(i, indent + "  </LockedFeature>\n")
            break

    with open(filepath, 'w') as f:
        f.writelines(lines)

wrap_return('components/dashboard/CropCalendarSection.tsx', 162, 2)

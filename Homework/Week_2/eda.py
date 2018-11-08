#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script does something.
"""

import csv
import pandas as pd

INPUT_CSV = 'input.csv'


def cleanup(dict_reader):
    """
    Deletes rows lacking information and removes surplus spaces from data.
    Takes a DictReader and its columns as input. Returns a list of dictionaries.
    """

    # extract column names
    columns = dict_reader.fieldnames

    # save all complete, and 'de-spaced' dictionaries in new list
    clean_rows = []
    for dict in dict_reader:
        row = {}
        info_complete = True

        # remove surplus spaces from data entries and check if they contain info
        for column in columns:
            row[column] = dict[column].strip()
            if not row[column] or row[column] == "unknown":
                info_complete = False

        # save rows with complete information
        if info_complete:
            clean_rows.append(row)

    return clean_rows


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        # extract information from csv input file
        reader = csv.DictReader(infile)

        # preprocess data
        rows = cleanup(reader)

        # for row in rows:
        #     print(row)

        data_frame = pd.DataFrame(rows)

        print(data_frame)

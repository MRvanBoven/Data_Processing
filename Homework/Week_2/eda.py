#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script does something.
"""

import csv
import numpy as np
import pandas as pd

INPUT_CSV = 'input.csv'
# OUTPUT_CSV = 'movies.csv'


def cleanup(dict_reader):
    """
    Deletes rows lacking information and removes extra spaces from data.
    Takes a DictReader and its columns as input. Returns a list of dictionaries.
    """

    print(dict_reader)

    # code source: https://stackoverflow.com/questions/40320170/access-column-using-dictreader
    columns = dict_reader.fieldnames

    for column in columns:
        print(column)

    clean_rows = []
    for dict in dict_reader:
        # print(dict)
        row = {}
        info_complete = True
        for column in columns:
            # print(dict[column])
            row[column] = dict[column].strip()
            if not row[column] or row[column] == "unknown":
                info_complete = False
        if info_complete:
            clean_rows.append(row)

    return clean_rows


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        reader = csv.DictReader(infile)

        rows = cleanup(reader)

        for row in rows:
            print(row)

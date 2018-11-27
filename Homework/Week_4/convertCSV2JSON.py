#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script loads in a CSV file and converts it to a JSON output file.
"""

import csv
import json
import numpy as np
import pandas as pd

# source: https://www.theguardian.com/news/datablog/2010/aug/20/doctor-who-time-travel-information-is-beautiful
INPUT_CSV = 'DoctorWhoTimetravel.csv'
OUTPUT_JSON = 'docto.json'


def ordinal(int):
    """
    Returns ordinal number string of given int, so 1 raises 1st, 2 2nd, ect.
    """

    # determine suffix to end ordinal number on
    if int == 1 or int % 10 == 1:
        suffix = "st"
    elif int == 2 or int % 10 == 2:
        suffix = "nd"
    elif int == 3 or int % 10 == 3:
        suffix = "rd"
    else:
        suffix = "th"

    ord = str(int) + suffix

    return ord


def preprocess(df):
    """
    Preprocesses given data frame. Returns preprocessed data frame.
    """

    # convert data in from and to columns to numbers, removing thousands commas
    for col in ['from ', 'to']:
        df[col] = df[col].str.replace(",", "")
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # save time travelled in new column
    df['travelled'] = abs(df['from '] - df['to'])

    # group data by doctor, calculating each locations average numerical cols
    df = df.groupby('doctor actor', as_index=False, sort=False).sum()

    # replace doctor actor by doctor incarnation
    for doctor, i in zip(df['doctor actor'], range(1, 12)):
        df = df.replace(doctor, ordinal(i))

    df = df.set_index('doctor actor')

    return df


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        # create pandas data frame from csv data in infile
        df = pd.read_csv(infile)

        infile.close()

    # preprocess data frame
    df = preprocess(df)

    # write columns of interest to json file, replacing NaN with None
    with open(OUTPUT_JSON, 'w') as outfile:
        json.dump(df[['travelled']].where((pd.notnull(df)), None)
                  .to_dict(orient='index'), outfile, indent=4)

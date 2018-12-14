#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script gets Star Trek episode data through API requests to stapi.co and
saves the desired data in an output JSON file.
"""

import json
import requests

OUTPUT_JSON = 'startrekEpisodes.json'


if __name__ == "__main__":

    # get the firs page of episodes through an API request
    r = requests.get("http://stapi.co/api/v1/rest/episode/search?pageNumber=0")
    page = r.json()

    # find the total number of pages and pagenumber in the first page response
    totalPages = int(page["page"]["totalPages"])
    page_nr = int(page["page"]["pageNumber"])

    # create array to save all episode API responses in
    all_episodes = [];

    # request API's for data about every single episode and save needed data
    while page_nr < totalPages:
        for episode in page["episodes"]:
            uid = episode["uid"]
            e_r = requests.get(f"http://stapi.co/api/v1/rest/episode?uid={uid}")
            eps = e_r.json()["episode"]

            # save name and gender of all episode's characters
            characters = [];
            for char in eps["characters"]:
                name = char["name"]
                gender = char["gender"]
                characters.append({"name": name,
                                   "gender": gender})

            # add data to created array
            all_episodes.append({"uid": eps["uid"],
                                 "title": eps["title"],
                                 "episodeNumber": eps["episodeNumber"],
                                 "seasonNumber": eps["seasonNumber"],
                                 "series": eps["series"]["title"],
                                 "characters": characters})

        page_nr += 1;

        # make sure no unnecessary API request is made
        if page_nr < totalPages:
            r = requests.get(f"http://stapi.co/api/v1/rest/episode/search?pageNumber={page_nr}")
            page = r.json()

    # write data to output JSON file
    with open(OUTPUT_JSON, 'w') as outfile:
        json.dump(all_episodes, outfile, indent=4)

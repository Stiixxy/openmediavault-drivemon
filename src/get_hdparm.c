#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#define LINE_SIZE 100

int interval = 60;
char hostname[100] = "localhost";

void replace_char(char *string, char from, char to)
{
    while (*string != '\n')
    {
        if (*string == from)
            *string = to;
        string++;
    }
}

int get_drive_state(char *string)
{
    if (strstr(string, "active/idle") != NULL)
        return 1;
    if (strstr(string, "standby") != NULL)
        return 0;
    if (strstr(string, "sleeping") != NULL)
        return 0;

    return -1;
}

int get_drive(char c)
{
    char command[100];
    sprintf(command, "/sbin/hdparm -C /dev/sd%c", c);
    // sprintf(command, "cat /dev/sd%c", c);
    FILE *fp = popen(command, "r");
    char lines[3][LINE_SIZE];
    for (int i = 0; i < 3; i++)
    {
        fgets(lines[i], LINE_SIZE, fp);
    }

    /* close */
    pclose(fp);

    replace_char(lines[1], ':', '\0');
    replace_char(lines[1], '/', '_');
    int state = get_drive_state(lines[2]);

    printf("PUTVAL %s/drivemon-%s/drive_state interval=%d N:%d\n", hostname, lines[1], interval, state);
}

int main(int argc, char **argv)
{
    if (argc <= 1)
        exit(-1);
    int status = setvbuf(stdout,
                         /* buf  = */ NULL,
                         /* mode = */ _IONBF, /* unbuffered */
                         /* size = */ 0);
    if (status != 0)
    {
        perror("setvbuf");
        exit(EXIT_FAILURE);
    }

    char *s = getenv("COLLECTD_INTERVAL");
    if (s != NULL)
        interval = strtol(s, 0, 10);
    s = getenv("COLLECTD_HOSTNAME");
    if (s != NULL)
        strcpy(hostname, s);

    while (1)
    {
        for (int i = 1; i < argc; i++)
        {
            char c = argv[i][0]; //first caracter only
            if (!(c >= 'a' && c <= 'z'))
                continue;
            get_drive(c);
        }
        sleep(interval);
    }

    return 0;
}